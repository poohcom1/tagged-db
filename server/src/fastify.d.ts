import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      role: "admin";
    };
    user: {
      role: "admin";
    };
  }
}

import "@fastify/cookie";

declare module "fastify" {
  interface FastifyRequest {
    cookies: Record<string, string>;
  }
}
