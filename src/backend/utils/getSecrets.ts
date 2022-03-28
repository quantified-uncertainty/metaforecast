export async function applyIfSecretExists(cookie, fun) {
  if (cookie) {
    await fun(cookie);
  } else if (!cookie) {
    console.log(
      `Cannot proceed with ${fun.name} because cookie does not exist`
    );
    throw new Error(`No cookie for ${fun.name}`);
  }
}
