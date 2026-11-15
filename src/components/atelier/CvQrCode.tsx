import { CV_QR } from "@/data/cv-qr";
import CvQrDrag from "./CvQrDrag";

// Encart flottant en bas à droite : QR code vers cv.23o.dev, qui redirige vers /CV.pdf.
// Le SVG est rendu côté serveur ; seul le déplacement (CvQrDrag) tourne dans le navigateur.
export default function CvQrCode() {
  return (
    <CvQrDrag>
      <span className="cv-qr-bob">
        <span className="cv-qr-tile">
          <svg
            viewBox={`0 0 ${CV_QR.size} ${CV_QR.size}`}
            aria-hidden="true"
            focusable="false"
          >
            <path d={CV_QR.dots} />
            {CV_QR.corners.map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <rect
                  x={x + 0.5}
                  y={y + 0.5}
                  width={6}
                  height={6}
                  rx={1.7}
                  fill="none"
                  stroke="currentColor"
                />
                <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.9} />
              </g>
            ))}
          </svg>
        </span>
      </span>
    </CvQrDrag>
  );
}
