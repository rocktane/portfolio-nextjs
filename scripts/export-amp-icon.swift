// Amp uses this SF Symbol in Sources/App/MenuBarController.swift.
// swift scripts/export-amp-icon.swift public/images/apps/amp.png
import AppKit
let image = NSImage(size: NSSize(width: 128, height: 128), flipped: false) { _ in
    let configuration = NSImage.SymbolConfiguration(pointSize: 80, weight: .regular)
        .applying(.init(paletteColors: [NSColor(red: 0.35, green: 0.47, blue: 0.95, alpha: 1)]))
    if let symbol = NSImage(systemSymbolName: "hifispeaker", accessibilityDescription: nil)?
        .withSymbolConfiguration(configuration) {
        let size = symbol.size
        symbol.draw(in: NSRect(x: (128-size.width)/2, y: (128-size.height)/2,
                              width: size.width, height: size.height))
    }
    return true
}
let bitmap = NSBitmapImageRep(data: image.tiffRepresentation!)!
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
