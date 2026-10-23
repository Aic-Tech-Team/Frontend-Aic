import { Clock, Mail, MapPin, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";

type Channel = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

export async function ContactChannels() {
  const t = await getTranslations("ContactPage");
  const footer = await getTranslations("Footer");

  const channels: Channel[] = [
    {
      icon: Mail,
      label: t("channels.email"),
      value: footer("email"),
      href: `mailto:${footer("email")}`,
    },
    { icon: MapPin, label: t("channels.address"), value: footer("address") },
    { icon: Clock, label: t("channels.hours"), value: footer("hours") },
  ];

  return (
    <div>
      <h2 className="text-sm font-bold text-muted-foreground">
        {t("channelsTitle")}
      </h2>
      <RevealGroup className="mt-4 border-b border-border/60" stagger={0.08}>
        {channels.map(({ icon: Icon, label, value, href }) => {
          const body = (
            <>
              <Icon
                aria-hidden="true"
                className="mt-1 h-5 w-5 shrink-0 text-primary-300"
              />
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">
                  {label}
                </span>
                <span className="mt-1 block break-words text-base font-bold leading-8 text-foreground">
                  {value}
                </span>
              </span>
            </>
          );
          const row =
            "group relative isolate flex items-start gap-4 overflow-hidden border-t border-border/60 px-2 py-5 sm:px-4";
          return (
            <RevealItem key={label} direction="up">
              {href ? (
                <a
                  href={href}
                  className={`${row} outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring`}
                >
                  {body}
                </a>
              ) : (
                <div className={row}>{body}</div>
              )}
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}
