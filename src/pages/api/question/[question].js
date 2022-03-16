// see: https://nextjs.org/docs/api-routes/dynamic-api-routes

export default function handler(req, res) {
  const { question } = req.query;
  res.end(`Platform: ${question}`);
}
