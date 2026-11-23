import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";

const NAV_ITEMS = [
  { label: "Início", to: "/", end: true },
  { label: "Sobre", to: "/sobre" },
  { label: "Programação", to: "/programacao" },
  { label: "Projetos", to: "/postagens?categoria=projetos" },
  { label: "Acervo", to: "/postagens?categoria=acervo" },
  { label: "Cine Hartãt", to: "/postagens?categoria=cine-hartat" },
  { label: "Intercâmbios", to: "/postagens?categoria=intercambios" },
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

export function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
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
              <ul className="divide-y divide-[#9A6A40]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      end={"end" in item ? item.end : false}
                      className={({ isActive }) =>
                        [
                          "group flex items-center justify-between rounded-sm px-2 py-3.5 text-lg font-medium transition-colors",
                          isActive && !item.to.includes("?")
                            ? "bg-[#46140A] text-white"
                            : "text-black hover:bg-[#46140A] hover:text-white",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => {
                        const active = isActive && !item.to.includes("?");
                        return (
                          <>
                            <span>{item.label}</span>
                            <CaretRightIcon
                              size={18}
                              weight="bold"
                              aria-hidden="true"
                              className={[
                                "shrink-0 transition-colors",
                                active
                                  ? "text-white"
                                  : "text-[#46140A] group-hover:text-white",
                              ].join(" ")}
                            />
                          </>
                        );
                      }}
                    </NavLink>
                  </li>
                ))}
              </ul>
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
              <ul className="divide-y divide-[#9A6A40]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      end={"end" in item ? item.end : false}
                      className={({ isActive }) =>
                        [
                          "group flex items-center justify-between rounded-sm px-2 py-2.5 text-lg font-normal transition-colors",
                          isActive && !item.to.includes("?")
                            ? "bg-[#46140A] text-white"
                            : "text-black hover:bg-[#46140A] hover:text-white",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => {
                        const active = isActive && !item.to.includes("?");
                        return (
                          <>
                            <span>{item.label}</span>
                            <CaretRightIcon
                              size={18}
                              weight="bold"
                              aria-hidden="true"
                              className={[
                                "shrink-0 transition-colors",
                                active
                                  ? "text-white"
                                  : "text-[#46140A] group-hover:text-white",
                              ].join(" ")}
                            />
                          </>
                        );
                      }}
                    </NavLink>
                  </li>
                ))}
              </ul>
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
