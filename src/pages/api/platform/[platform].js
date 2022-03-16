// see: https://nextjs.org/docs/api-routes/dynamic-api-routes

export default function handler(req, res) {
  const { platform } = req.query;
  res.end(`Platform: ${platform}`);
}
