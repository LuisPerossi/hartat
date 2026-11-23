import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { normalizeCategoryKey } from "@/lib/format";

const PRIMARY_NAV_ITEMS = [
  { label: "Início", to: "/", end: true },
  { label: "Sobre", to: "/sobre" },
  { label: "Programação", to: "/programacao" },
] as const;

const POST_SUB_ITEMS = [
  { label: "Acervo", category: "Acervo" },
  { label: "Blog", category: "Blog" },
  { label: "Cinema", category: "Cinema" },
  { label: "Eventos", category: "Eventos" },
  { label: "Exposições", category: "Exposições" },
] as const;

const SOCIAL_LINKS = [
  {
    name: "WhatsApp",
    href: "https://wa.me/5512981950786",
    icon: "/icons/whatsapp.svg",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/espacohartat/",
    icon: "/icons/instagram.svg",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61574629659741",
    icon: "/icons/facebook.svg",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@claudioluizdias8978",
    icon: "/icons/youtube.svg",
  },
] as const;

function HorizontalPatternStrip() {
  return (
    <div
      aria-hidden="true"
      className="h-6 w-full bg-primary bg-repeat-x"
      style={{
        backgroundImage: "url('/patterns/border-pattern.svg')",
        backgroundSize: "auto 100%",
      }}
    />
  );
}

function VerticalPatternStrip() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative w-7 shrink-0 overflow-hidden bg-primary"
    >
      <div
        className="absolute top-0 left-0 h-7 w-[3000px] origin-top-left bg-repeat-x"
        style={{
          backgroundImage: "url('/patterns/border-pattern.svg')",
          backgroundSize: "auto 100%",
          transform: "rotate(90deg) translateY(-100%)",
        }}
      />
    </div>
  );
}

interface SidebarNavProps {
  mode: "desktop" | "mobile";
  postsOpen: boolean;
  onTogglePosts: () => void;
  itemPaddingClass: string;
  itemWeightClass: string;
}

function SidebarNav({
  mode,
  postsOpen,
  onTogglePosts,
  itemPaddingClass,
  itemWeightClass,
}: SidebarNavProps) {
  const location = useLocation();
  const isOnPostsRoute = location.pathname.startsWith("/postagens");
  const activeCategoryKeys = new Set(
    new URLSearchParams(location.search)
      .getAll("categoria")
      .flatMap((v) => v.split(","))
      .map(normalizeCategoryKey)
      .filter(Boolean),
  );
  const isPostsRootActive =
    location.pathname === "/postagens" && activeCategoryKeys.size === 0;

  return (
    <ul className="divide-y divide-[#9A6A40]">
      {PRIMARY_NAV_ITEMS.map((item) => (
        <li key={item.label}>
          <NavLink
            to={item.to}
            end={"end" in item ? item.end : false}
            className={({ isActive }) =>
              [
                `group flex items-center justify-between rounded-sm px-2 ${itemPaddingClass} text-lg ${itemWeightClass} transition-colors`,
                isActive
                  ? "bg-[#46140A] text-white"
                  : "text-black hover:bg-[#46140A] hover:text-white",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span>{item.label}</span>
                <CaretRightIcon
                  size={18}
                  weight="bold"
                  aria-hidden="true"
                  className={[
                    "shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-[#46140A] group-hover:text-white",
                  ].join(" ")}
                />
              </>
            )}
          </NavLink>
        </li>
      ))}

      {/* Postagens with hover-reveal on desktop and tap-toggle on mobile */}
      {mode === "desktop" ? (
        <li className="group/posts">
          <Link
            to="/postagens"
            className={[
              `group flex items-center justify-between rounded-sm px-2 ${itemPaddingClass} text-lg ${itemWeightClass} transition-colors`,
              isPostsRootActive
                ? "bg-[#46140A] text-white"
                : "text-black hover:bg-[#46140A] hover:text-white",
            ].join(" ")}
          >
            <span>Postagens</span>
            <CaretDownIcon
              size={18}
              weight="bold"
              aria-hidden="true"
              className={[
                "shrink-0 transition-all duration-200 group-hover/posts:rotate-180 group-focus-within/posts:rotate-180",
                isPostsRootActive
                  ? "text-white"
                  : "text-[#46140A] group-hover:text-white",
              ].join(" ")}
            />
          </Link>

          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-hover/posts:grid-rows-[1fr] group-focus-within/posts:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <ul className="mt-1 mb-2 ml-3 space-y-0.5 border-l-2 border-[#9A6A40]/80 pl-2.5">
                {POST_SUB_ITEMS.map((sub) => {
                  const isSubActive =
                    isOnPostsRoute &&
                    activeCategoryKeys.size === 1 &&
                    activeCategoryKeys.has(normalizeCategoryKey(sub.category));

                  return (
                    <li key={sub.category}>
                      <Link
                        to={`/postagens?categoria=${encodeURIComponent(sub.category)}`}
                        className={[
                          "group flex items-center justify-between rounded-sm px-2 py-2 text-base transition-colors",
                          isSubActive
                            ? "bg-[#46140A] font-medium text-white"
                            : "text-black/90 hover:bg-[#46140A] hover:text-white",
                        ].join(" ")}
                      >
                        <span>{sub.label}</span>
                        <CaretRightIcon
                          size={15}
                          weight="bold"
                          aria-hidden="true"
                          className={[
                            "shrink-0 transition-colors",
                            isSubActive
                              ? "text-white"
                              : "text-[#46140A] group-hover:text-white",
                          ].join(" ")}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </li>
      ) : (
        <li>
          <div
            className={[
              "group flex items-center justify-between rounded-sm transition-colors",
              isPostsRootActive
                ? "bg-[#46140A] text-white"
                : "text-black hover:bg-[#46140A] hover:text-white",
            ].join(" ")}
          >
            <Link
              to="/postagens"
              className={`flex-1 px-2 ${itemPaddingClass} text-lg ${itemWeightClass}`}
            >
              Postagens
            </Link>
            <button
              type="button"
              onClick={onTogglePosts}
              aria-expanded={postsOpen}
              aria-label={
                postsOpen
                  ? "Recolher categorias de postagens"
                  : "Expandir categorias de postagens"
              }
              className={`flex cursor-pointer items-center justify-center px-2 ${itemPaddingClass}`}
            >
              <CaretDownIcon
                size={18}
                weight="bold"
                aria-hidden="true"
                className={[
                  "shrink-0 transition-transform duration-200",
                  postsOpen ? "rotate-180" : "",
                  isPostsRootActive
                    ? "text-white"
                    : "text-[#46140A] group-hover:text-white",
                ].join(" ")}
              />
            </button>
          </div>

          {postsOpen && (
            <ul className="mt-1 mb-2 ml-3 space-y-0.5 border-l-2 border-[#9A6A40]/80 pl-2.5">
              {POST_SUB_ITEMS.map((sub) => {
                const isSubActive =
                  isOnPostsRoute &&
                  activeCategoryKeys.size === 1 &&
                  activeCategoryKeys.has(normalizeCategoryKey(sub.category));

                return (
                  <li key={sub.category}>
                    <Link
                      to={`/postagens?categoria=${encodeURIComponent(sub.category)}`}
                      className={[
                        "group flex items-center justify-between rounded-sm px-2 py-2 text-base transition-colors",
                        isSubActive
                          ? "bg-[#46140A] font-medium text-white"
                          : "text-black/90 hover:bg-[#46140A] hover:text-white",
                      ].join(" ")}
                    >
                      <span>{sub.label}</span>
                      <CaretRightIcon
                        size={15}
                        weight="bold"
                        aria-hidden="true"
                        className={[
                          "shrink-0 transition-colors",
                          isSubActive
                            ? "text-white"
                            : "text-[#46140A] group-hover:text-white",
                        ].join(" ")}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      )}
    </ul>
  );
}

export function Sidebar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [postsOpen, setPostsOpen] = useState(() =>
    location.pathname.startsWith("/postagens"),
  );

  useEffect(() => {
    setMenuOpen(false);
    if (location.pathname.startsWith("/postagens")) {
      setPostsOpen(true);
    }
  }, [location.pathname, location.search]);

  return (
    <>
      {/* Mobile Header (< lg) */}
      <header className="sticky top-0 z-40 w-full bg-primary lg:hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link to="/" aria-label="Espaço Hartãt — Página inicial">
            <img
              src="/logos/Hartat.svg"
              alt="Espaço Hartãt — Acervo Indígena"
              className="h-14 w-auto"
            />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="flex h-11 w-11 items-center justify-center rounded-md text-[#1e1e1e] transition-colors hover:bg-black/10"
          >
            {menuOpen ? (
              <XIcon size={30} weight="bold" />
            ) : (
              <ListIcon size={30} weight="bold" />
            )}
          </button>
        </div>

        {!menuOpen && <HorizontalPatternStrip />}

        {menuOpen && (
          <div
            id="mobile-nav"
            className="absolute inset-x-0 top-full max-h-[calc(100vh-4.75rem)] overflow-y-auto bg-primary shadow-xl"
          >
            <nav aria-label="Navegação principal" className="px-5 pt-2 pb-4">
              <SidebarNav
                mode="mobile"
                postsOpen={postsOpen}
                onTogglePosts={() => setPostsOpen((prev) => !prev)}
                itemPaddingClass="py-3.5"
                itemWeightClass="font-medium"
              />
            </nav>

            <div className="flex items-center justify-center gap-5 px-5 pb-5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="transition-opacity hover:opacity-75"
                >
                  <img
                    src={social.icon}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                </a>
              ))}
            </div>

            <HorizontalPatternStrip />
          </div>
        )}
      </header>

      {/* Desktop Fixed Sidebar (>= lg) */}
      <aside className="hidden w-64 shrink-0 bg-primary lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-row">
        <div className="flex h-full min-w-0 flex-1 flex-col justify-between overflow-y-auto px-4 py-7">
          {/* Logo */}
          <div>
            <Link
              to="/"
              aria-label="Espaço Hartãt — Página inicial"
              className="block px-1"
            >
              <img
                src="/logos/Hartat.svg"
                alt="Espaço Hartãt — Acervo Indígena"
                className="mx-auto h-auto w-44"
              />
            </Link>

            {/* Navigation */}
            <nav aria-label="Navegação principal" className="mt-8">
              <SidebarNav
                mode="desktop"
                postsOpen={postsOpen}
                onTogglePosts={() => setPostsOpen((prev) => !prev)}
                itemPaddingClass="py-2.5"
                itemWeightClass="font-normal"
              />
            </nav>
          </div>

          {/* Social Links */}
          <div className="mt-8 flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="transition-opacity hover:opacity-75"
              >
                <img
                  src={social.icon}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </a>
            ))}
          </div>
        </div>

        <VerticalPatternStrip />
      </aside>
    </>
  );
}
