export const helloRoutes = {
  "/api/hello": {
    async GET(req: Request) {
      return Response.json({ message: "Hello, world!", method: "GET" });
    },
    async PUT(req: Request) {
      return Response.json({ message: "Hello, world!", method: "PUT" });
    },
  },

  "/api/hello/:name": async (req: any) => {
    const name = req.params?.name ?? "unknown";
    return Response.json({ message: `Hello, ${name}!` });
  },
};