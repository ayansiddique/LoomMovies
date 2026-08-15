import { watch } from '../api/get-hindi-stream.js';

async function run() {
  try {
    const s = await watch('death-note-episode-2');
    console.log("Sources for episode 2:", JSON.stringify(s, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
