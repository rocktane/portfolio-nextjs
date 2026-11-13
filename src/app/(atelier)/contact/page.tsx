import type { Metadata } from "next";
import ContactActions from "@/components/atelier/ContactActions";
import Icon from "@/components/atelier/Icon";
import { TYPEFORM_ID } from "@/constants/theme";
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter Yohan Gouiran pour un projet, une mission ou une question.",
  alternates: { canonical: "/contact" },
};
export default function ContactPage() {
  return (
    <>
      <div className="page-heading">
        <h1>Contact</h1>
      </div>
      <section className="contact-page" aria-labelledby="contact-title">
        <h2 id="contact-title">Un projet ? Une mission ?</h2>
        <a className="contact-email" href="mailto:dev@yohangouiran.com">
          dev@yohangouiran.com
        </a>
        <ContactActions />
        <a
          className="contact-option"
          href={`https://form.typeform.com/to/${TYPEFORM_ID}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>
            Présenter un projet<small>Formulaire de contact</small>
          </span>
          <Icon name="arrow" />
        </a>
        <a
          className="contact-option"
          href="https://www.linkedin.com/in/yohan-g"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>
            LinkedIn<small>Échanger sur une mission</small>
          </span>
          <Icon name="arrow" />
        </a>
      </section>
    </>
  );
}
