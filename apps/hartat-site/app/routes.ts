import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/layout/SiteLayout.tsx", [
    index("routes/home.tsx"),
    route("sobre", "routes/sobre.tsx"),
    route("postagens", "routes/postagens.tsx"),
    route("postagens/:slug", "routes/postagem.tsx"),
    route("programacao", "routes/programacao.tsx"),
  ]),
] satisfies RouteConfig;
