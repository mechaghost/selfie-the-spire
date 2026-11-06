// Build-time preparation only. Never download model weights in a player request.
if (process.env.ENABLE_PERSONALIZED_COMBAT === '1') {
    await import('./prepare-combat-model.mjs');
} else {
    console.log('Personalized combat disabled; skipping model preparation');
}
