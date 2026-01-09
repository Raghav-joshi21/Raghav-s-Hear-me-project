/**
 * Test endpoint to verify serverless functions are working
 */
export default async function handler(req, res) {
  res.status(200).json({
    message: "Serverless function is working!",
    method: req.method,
    url: req.url,
    query: req.query,
    timestamp: new Date().toISOString(),
  });
}

