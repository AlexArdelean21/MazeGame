export const teleportationFrames = [];
export const totalTeleportationFrames = 2; 
let teleportationImagesLoaded = 0;
export let teleportationImagesReady = false;

for (let i = 0; i < totalTeleportationFrames; i++) {
    const img = new Image();
    img.src = `../characters/teleportation_frames/teleport_${i}.png`;
    img.onload = () => {
        teleportationImagesLoaded++;
        console.log(`Loaded teleportation frame ${i}`);
        if (teleportationImagesLoaded === totalTeleportationFrames) {
            teleportationImagesReady = true;
            console.log('All teleportation images loaded.');
        }
    };
    img.onerror = (error) => {
        console.error(`Failed to load teleportation frame ${i}`, error);
    };
    teleportationFrames.push(img);
}
