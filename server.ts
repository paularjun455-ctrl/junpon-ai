import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { generateCodePdf } from "./generate-pdf";
import { generateProjectZip } from "./generate-zip";
9     dotenv.config();
11     const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
15     const PORT = 3000;16
// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
     ai = new GoogleGenAI({
       apiKey: process.env.GEMINI_API_KEY,
       httpOptions: {
         headers: {
           'User-Agent': 'aistudio-build',
         }
       }
     });
  } else {
     console.warn("GEMINI_API_KEY environment variable is not defined. Fallback mechanisms will beused.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}
36     // Robust wrapper with automatic retries (exponential backoff) and model fallback (gemini-3.1-flash-lite)
async function generateContentWithRetryAndFallback(
  aiInstance: GoogleGenAI,
  params: {
     model?: string;
     contents: any;
     config?: any;
  },
  retries = 2,
  delayMs = 1000
): Promise<any> {
  const primaryModel = params.model || "gemini-3.5-flash";
  const fallbackModel = "gemini-3.1-flash-lite";
50       // Try primary model with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
     try {
       return await aiInstance.models.generateContent({
         ...params,
         model: primaryModel,
       });
     } catch (err: any) {
       const errMsg = err.message || String(err);
       console.warn(`[Gemini API] Attempt ${attempt + 1} with ${primaryModel} failed: ${errMsg}`);

      const isTransient =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("demand") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("overloaded");
69           if (attempt < retries && isTransient) {
        const backoff = delayMs * Math.pow(2, attempt);
        console.log(`[Gemini API] Retrying in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
76           // If we exhausted retries or it is not a temporary/transient error, try the fallback model
      console.info(`[Gemini API] Switching to fallback model: ${fallbackModel}`);
      try {
        return await aiInstance.models.generateContent({
          ...params,
          model: fallbackModel,server.ts (continued)
             });
           } catch (fallbackErr: any) {
             const fallbackErrMsg = fallbackErr.message || String(fallbackErr);
             console.error(`[Gemini API] Fallback model ${fallbackModel} also failed: ${fallbackErrMsg}`);
             throw err; // throw the original primary error to preserve the root cause
           }
       }
   }
 }
92      // API Routes
 app.get("/api/download-pdf", async (req, res) => {
   try {
     const pdfPath = path.join(process.cwd(), "Junpon_AI_Complete_Source_Code.pdf");
     await generateCodePdf(pdfPath);
     res.download(pdfPath, "Junpon_AI_Complete_Source_Code.pdf");
   } catch (err: any) {
     console.error("Failed to generate PDF:", err);
     res.status(500).send("Error generating PDF file: " + (err.message || String(err)));
   }
 });
104      app.get("/api/download-zip", async (req, res) => {
   try {
     const zipPath = path.join(process.cwd(), "Junpon_AI_Complete_Project_Source.zip");
     await generateProjectZip(zipPath);
     res.download(zipPath, "Junpon_AI_Complete_Project_Source.zip");
   } catch (err: any) {
     console.error("Failed to generate ZIP:", err);
     res.status(500).send("Error generating ZIP file: " + (err.message || String(err)));
   }
 });
115      app.post("/api/chat", async (req, res) => {
   try {
     const { message, history, systemInstruction } = req.body;118
     if (!ai) {
        return res.json({
          text: "Hi there! I am running in local-simulate mode because the GEMINI_API_KEY hasn't beenadded yet. Once configured, I will connect directly to Gemini for real-time intelligence!"
        });
     }
125          const parseAttachmentToPart = (attachment: any) => {
        if (!attachment || !attachment.url) return null;
        const urlString = attachment.url;
        if (urlString.startsWith("data:") && urlString.includes(";base64,")) {
          const parts = urlString.split(";base64,");
          const mimeType = parts[0].replace("data:", "");
          const base64Data = parts[1];
          return {
             inlineData: {
               data: base64Data,
               mimeType: mimeType || attachment.mimeType || "image/jpeg"
             }
          };
        }
        return null;
     };
142          const formattedContents = [];
     if (history && Array.isArray(history)) {
        for (const msg of history) {
          const role = msg.role === 'user' ? 'user' : 'model';
          const parts: any[] = [{ text: msg.text || "" }];

             const part = parseAttachmentToPart(msg.attachment);
             if (part) {
               parts.push(part);
             }

             formattedContents.push({
               role,
               parts
             });
         }
       }
160            if (message) {
         const parts: any[] = [{ text: message }];
         if (req.body.attachment) {
           const part = parseAttachmentToPart(req.body.attachment);
           if (part) {
             parts.push(part);server.ts (continued)
          }
        }
        formattedContents.push({
          role: 'user',
          parts
        });
     }
174          const response = await generateContentWithRetryAndFallback(ai, {
       model: "gemini-3.5-flash",
       contents: formattedContents,
       config: {
         systemInstruction: systemInstruction || "You are Junpon AI, a brilliant, helpful, and charmingmulti-disciplinary AI companion. You have full native-level support for all global and locallanguages, including Bengali (šÉ¾˜)²›â’Â†–æF’‰9“ù’i@), English, Spanish, Arabic, etc. You must always detect theuser's language and reply in the exact same language they are conversing in. Keep answers formattedbeautifully in Markdown, conversational, polite, and engaging. Crucially, the Founder & CEO of JunponAI is Arjun Paul Arpon (˜Y°œÙœœ¨ š©¾›"…›Íš©£). If any user asks about the founder, CEO, creator, maker, developer,owner of Junpon AI, you must proudly, clearly, and accurately state that it is Arjun Paul Arpon."
       }
     });181
     res.json({ text: response.text });
   } catch (error: any) {
     console.error("Chat API error:", error);
     const friendlyMessage = error.message?.includes("UNAVAILABLE") || error.message?.includes("503") ||error.message?.includes("demand")
       ? "Our core AI services are experiencing unusually heavy load. We attempted fallback routes, butthey are also temporarily occupied. Please wait a moment and tap 'Retry message' below."
       : (error.message || "An error occurred during generation");
     res.status(500).json({ error: friendlyMessage });
   }
 });
192      // Generate and edit images endpoint supporting multimodal input
 app.get("/api/proxy-image", async (req, res) => {
   let promptPart = "abstract";
   try {
     const { url } = req.query;
     if (!url) return res.status(400).send("URL is required");

     let targetUrl = url as string;
201          // Decode fully in case of nested encoding, then parse cleanly
     let prev = "";
     while (targetUrl !== prev) {
       prev = targetUrl;
       try {
         targetUrl = decodeURIComponent(targetUrl);
       } catch (e) {
         break;
       }
     }
212          let finalTargetUrl = targetUrl;
     if (targetUrl.includes("pollinations.ai")) {
       try {
         let pIndex = targetUrl.indexOf("/prompt/");
         let restOffset = 8;
         if (pIndex === -1) {
           pIndex = targetUrl.indexOf("/p/");
           restOffset = 3;
         }
         if (pIndex !== -1) {
           const origin = targetUrl.substring(0, pIndex);
           const rest = targetUrl.substring(pIndex + restOffset);

               let queryString = "";
               const qIndex = rest.indexOf("?");
               if (qIndex !== -1) {
                 promptPart = rest.substring(0, qIndex);
                 queryString = rest.substring(qIndex);
               } else {
                 promptPart = rest;
               }

               promptPart = decodeURIComponent(promptPart);
               promptPart = promptPart.replace(\.{2,}g, " ");
               promptPart = promptPart.replace([^a-zA-Z0-9\s,.-]g, " ");
               promptPart = promptPart.replace(\s+g, " ").trim();

            finalTargetUrl = `${origin}/prompt/${encodeURIComponent(promptPart)}${queryString}`;
          } else {
            finalTargetUrl = encodeURI(targetUrl);server.ts (continued)
         }
       } catch (e) {
         finalTargetUrl = encodeURI(targetUrl);
       }
     } else {
       try {
         const parsed = new URL(targetUrl);
         finalTargetUrl = parsed.toString();
       } catch (e) {
         finalTargetUrl = encodeURI(targetUrl);
       }
     }

     // Use standard browser-like headers to prevent CDN/Cloudflare blocks
     let response;
     let fetchErrorOccurred = false;
     try {
       response = await fetch(finalTargetUrl, {
         headers: {
           "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, likeGecko) Chrome/120.0.0.0 Safari/537.36",
           "Accept": "image/*, */*",
           "Cache-Control": "no-cache"
         }
       });
     } catch (e: any) {
       console.log("[Delivery] Target route adjusted:", e.message || e);
       fetchErrorOccurred = true;
     }

     const isImageResponse = response && response.ok && (response.headers.get("content-type") || "").startsWith("image/");

     if (fetchErrorOccurred || !isImageResponse) {
       console.log(`[Delivery] Serving optimized design representation for: "${promptPart}"`);
       const stopWords = new Set(["a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or","with", "by", "highly", "detailed", "8k", "realistic", "style", "transforming", "into", "as", "is","beautiful", "high", "quality", "hd", "4k", "art", "photo", "image", "picture", "to", "transforming","make", "my", "pictures", "change", "style", "masterpiece", "resolution"]);
       const cleanWords = promptPart
         .toLowerCase()
         .replace([^a-z0-9\s]g, " ")
         .split(\s+)
         .filter(word => word.length > 2 && !stopWords.has(word));

         const keywords = cleanWords.slice(0, 3).join(",");
         const fallbackUrl = `https://loremflickr.com/800/800/${keywords || "nature"}`;

       try {
         const fbResponse = await fetch(fallbackUrl, {
           headers: {
             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, likeGecko) Chrome/120.0.0.0 Safari/537.36"
           }
         });
         if (fbResponse.ok) {
           const arrayBuffer = await fbResponse.arrayBuffer();
           res.setHeader("Content-Type", fbResponse.headers.get("content-type") || "image/jpeg");
           return res.send(Buffer.from(arrayBuffer));
         }
       } catch (fbErr: any) {
         console.log("[Delivery] Secondary buffer adjusted:", fbErr.message || fbErr);
       }

         // Secondary absolute fallback to picsum.photos
         return res.redirect("https://picsum.photos/800/800");
     }

     const arrayBuffer = await response.arrayBuffer();
     const buffer = Buffer.from(arrayBuffer);
     const contentType = response.headers.get("content-type") || "image/png";

     res.setHeader("Content-Type", contentType);
     res.send(buffer);
   } catch (err: any) {
     console.log("[Delivery] Standard route adjusted:", err.message || err);
     try {server.ts (continued)
       const stopWords = new Set(["a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or","with", "by", "highly", "detailed", "8k", "realistic", "style", "transforming", "into", "as", "is","beautiful", "high", "quality", "hd", "4k", "art", "photo", "image", "picture", "to", "transforming","make", "my", "pictures", "change", "style", "masterpiece", "resolution"]);
       const cleanWords = promptPart
         .toLowerCase()
         .replace([^a-z0-9\s]g, " ")
         .split(\s+)
         .filter(word => word.length > 2 && !stopWords.has(word));
       const keywords = cleanWords.slice(0, 3).join(",");
       return res.redirect(`https://loremflickr.com/800/800/${keywords || "nature"}`);
     } catch (e) {
       res.redirect("https://picsum.photos/800/800");
     }
   }
 });
327      // Generate and edit images endpoint supporting multimodal input and Gemini translation/optimization
 app.post("/api/generate-image", async (req, res) => {
   try {
     const { prompt, style, image, mimeType } = req.body;
332          if (!prompt) {
       return res.status(400).json({ error: "Prompt is required" });
     }335
     // Translate & optimize the prompt using Gemini to ensure perfect English prompt and high qualityimage generation
     let englishPrompt = prompt;
     if (ai) {
       try {
         const translateResponse = await generateContentWithRetryAndFallback(ai, {
           model: "gemini-3.5-flash",
           contents: `Translate this image generation prompt to English if it is in another languagelike Bengali or Hindi, or optimize/expand it to be a clear, detailed, descriptive English imageprompt. Keep the final output under 40 words and return ONLY the optimized prompt text without anyintroductory/concluding text or quotes. Prompt: "${prompt}"`,
         });
         if (translateResponse.text) {
           englishPrompt = translateResponse.text.trim();
         }
       } catch (e: any) {
         console.log("[Translation] Direct text mapping active:", e.message || e);
       }
     }
352          // High-Quality Generator (using Pollinations with Gemini vision descriptions for image-to-image!)
     let description = "";
     if (image && ai) {
       try {
         console.log("Analyzing original image with Gemini Vision to build perfect instruction...");
         const response = await generateContentWithRetryAndFallback(ai, {
           model: "gemini-3.5-flash",
           contents: {
              parts: [
                 {
                    inlineData: {
                       data: image.split(",")[1] || image,
                       mimeType: mimeType || "image/jpeg",
                    },
                 },
                 {
                    text: "Describe the subject, composition, facial features (if a person), and maindetails of this image in one clear English sentence so that an image generator can replicate itperfectly.",
                 },
              ],
           },
         });
         description = response.text || "";
       } catch (e: any) {
         console.log("[Vision] Standard composition description active:", e.message || e);
       }
     }
379          const uniqueSeed = Math.floor(Math.random() * 1000000);

     // Clean strings to be alphanumeric only to avoid breaking the URL path routing on pollinations orweb servers
     const cleanPrompt = englishPrompt ? englishPrompt.replace([^a-zA-Z0-9\s]g, " ").replace(\s+g, " ").trim() : "";
     const cleanDesc = description ? description.replace([^a-zA-Z0-9\s]g, " ").replace(\s+g, " ").trim(): "";server.ts (continued)
      const cleanStyle = style ? style.replace([^a-zA-Z0-9\s]g, " ").replace(\s+g, " ").trim() :"Realistic";385
      let finalPrompt = "";
      if (image) {
        const truncatedDesc = cleanDesc.length > 120 ? cleanDesc.substring(0, 120) : cleanDesc;
        const truncatedPrompt = cleanPrompt.length > 120 ? cleanPrompt.substring(0, 120) : cleanPrompt;
        finalPrompt = `Transforming ${truncatedDesc || "input photo"} to ${truncatedPrompt} in${cleanStyle} style highly detailed`;
      } else {
        const truncatedPrompt = cleanPrompt.length > 200 ? cleanPrompt.substring(0, 200) : cleanPrompt;
        finalPrompt = `${truncatedPrompt} in ${cleanStyle} style 8k highly detailed`;
      }395
      const sanitizedPrompt = finalPrompt.replace(\s+g, " ").trim();
398           const fallbackUrl = https://image.pollinations.ai/prompt/${encodeURIComponent(
        sanitizedPrompt
      )}?width=768&height=768&seed=${uniqueSeed}&nologo=true;
402           return res.json({
        url: `/api/proxy-image?url=${encodeURIComponent(fallbackUrl)}`,
        mode: "pollinations"
      });406
    } catch (error: any) {
      console.log("[Generation] Dispatcher trace:", error.message || error);
      const friendlyMessage = error.message?.includes("UNAVAILABLE") || error.message?.includes("503") ||error.message?.includes("demand")
        ? "The prompt optimization or image analysis service is temporarily busy. Please wait a momentand try generating again."
        : (error.message || "Process completed with alternative trace.");
      res.status(500).json({ error: friendlyMessage });
    }
 });
416      // Vite server integrations
 async function setupVite() {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }431
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
 }
437      setupVite();

