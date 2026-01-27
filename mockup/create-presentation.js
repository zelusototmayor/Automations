const pptxgen = require("pptxgenjs");
const { html2pptx } = require("/sessions/modest-stoic-thompson/html2pptx");
const path = require("path");

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "Claude";
  pptx.title = "Better Coaching UI Mockup";
  pptx.subject = "UI Design Mockup for Better Coaching App";

  const slidesDir = "/sessions/modest-stoic-thompson/mnt/Desktop/code/bettercoaching/mockup";

  console.log("Creating presentation...");

  // Slide 1: Cover
  console.log("Processing slide 1: Cover");
  await html2pptx(path.join(slidesDir, "slide1-cover.html"), pptx);

  // Slide 2: Design System
  console.log("Processing slide 2: Design System");
  await html2pptx(path.join(slidesDir, "slide2-design-system.html"), pptx);

  // Slide 3: Home Screen
  console.log("Processing slide 3: Home Screen");
  await html2pptx(path.join(slidesDir, "slide3-home-screen.html"), pptx);

  // Slide 4: Explore Screen
  console.log("Processing slide 4: Explore Screen");
  await html2pptx(path.join(slidesDir, "slide4-explore-screen.html"), pptx);

  // Slide 5: Coach Detail
  console.log("Processing slide 5: Coach Detail");
  await html2pptx(path.join(slidesDir, "slide5-coach-detail.html"), pptx);

  // Slide 6: Chat Screen
  console.log("Processing slide 6: Chat Screen");
  await html2pptx(path.join(slidesDir, "slide6-chat-screen.html"), pptx);

  // Slide 7: Component Library
  console.log("Processing slide 7: Component Library");
  await html2pptx(path.join(slidesDir, "slide7-components.html"), pptx);

  // Save the presentation
  const outputPath = "/sessions/modest-stoic-thompson/mnt/Desktop/BetterCoaching-UI-Mockup.pptx";
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation saved to: ${outputPath}`);
}

createPresentation().catch(err => {
  console.error("Error creating presentation:", err);
  process.exit(1);
});
