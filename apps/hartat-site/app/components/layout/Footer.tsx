export function Footer() {
  return (
    <footer className="w-full bg-secondary text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8 lg:py-14">
        {/* Logos */}
        <div className="flex flex-col items-center gap-5 lg:flex-row lg:gap-7 shrink-0">
          <img
            src="/logos/Hartat.svg"
            alt="Logomarca do Espaço Hartãt"
            className="h-24 w-auto lg:h-20"
          />
          <img
            src="/logos/CarloCury.svg"
            alt="Logomarca Carlo Cury Cerâmica"
            className="h-28 w-auto lg:h-20"
          />
        </div>

        {/* Info columns */}
        <div className="grid w-full max-w-sm grid-cols-1 gap-6 text-sm leading-relaxed lg:max-w-none lg:flex-1 lg:grid-cols-3 lg:gap-7">
          <div>
            <p className="font-medium">Endereço:</p>
            <p>Rua Bartolomeu Bueno da Silva, 1231 - Martim de Sá</p>
            <p>Caraguatatuba, SP - 11662-300</p>
          </div>

          <div>
            <p className="font-medium">Contato:</p>
            <p>
              TEL:{" "}
              <a href="tel:+5512981950786" className="hover:underline">
                +55 (12) 98195-0786
              </a>
            </p>
            <p>
              E-mail:{" "}
              <a
                href="mailto:ubuntucaragua@gmail.com"
                className="hover:underline"
              >
                ubuntucaragua@gmail.com
              </a>
            </p>
          </div>

          <div>
            <p className="font-medium">Horário de atendimento:</p>
            <p>Segunda à domingo, das 9h às 12h e das 14h às 17h</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
