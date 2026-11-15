// Reproduces mdeck Sources/Settings/ModuleTile.swift using the symbols and tints
// from Sources/Modules/*/*Module.swift. Run on macOS:
// swift scripts/export-mdeck-icons.swift public/images/apps/mdeck-modules
import AppKit
let modules: [(String,String,NSColor)] = [("night-shift-focus","moon.fill",.systemOrange),("altty","rectangle.on.rectangle",.systemIndigo),("app-monitor","chart.bar.fill",.systemOrange),("dock-lock","dock.rectangle",.systemTeal),("keep-awake","cup.and.saucer.fill",.systemOrange),("clean-links","link",.systemGreen),("ping","network",.systemGreen)]
for (id,symbol,tint) in modules {
 let image = NSImage(size:NSSize(width:128,height:128), flipped:false) { _ in
  let rect=NSRect(x:12,y:12,width:104,height:104)
  let path=NSBezierPath(roundedRect:rect,xRadius:104*0.225,yRadius:104*0.225)
  NSGradient(colors:[tint.blended(withFraction:0.18,of:.white) ?? tint,tint])?.draw(in:path,angle:-90)
  let config=NSImage.SymbolConfiguration(pointSize:104*0.52,weight:.semibold).applying(.init(paletteColors:[.white]))
  if let glyph=NSImage(systemSymbolName:symbol,accessibilityDescription:nil)?.withSymbolConfiguration(config) {
   let s=glyph.size
   glyph.draw(in:NSRect(x:rect.midX-s.width/2,y:rect.midY-s.height/2,width:s.width,height:s.height))
  }
  return true
 }
 let bitmap=NSBitmapImageRep(data:image.tiffRepresentation!)!
 try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:CommandLine.arguments[1]+"/"+id+".png"))
}
