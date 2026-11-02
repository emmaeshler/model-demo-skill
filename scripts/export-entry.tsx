import { createRoot } from "react-dom/client";
import { DepthProvider } from "../src/lib/depth-context";
import { ModeProvider } from "../src/lib/mode-context";
import { ShareProvider } from "../src/lib/share-context";
import { ViewportAutoZoom } from "../src/components/viewport-auto-zoom";
import Home from "../src/app/page";

const container = document.getElementById("__export_root")!;
const root = createRoot(container);
root.render(
  <ModeProvider>
    <ShareProvider>
      <div id="preview-frame" className="flex flex-1 flex-col">
        <DepthProvider>
          <Home />
        </DepthProvider>
      </div>
      <ViewportAutoZoom />
    </ShareProvider>
  </ModeProvider>,
);
