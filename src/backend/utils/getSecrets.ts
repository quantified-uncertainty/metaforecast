export async function applyIfSecretExists<T>(
  cookie,
  fun: (...args: any[]) => T
) {
  if (cookie) {
    return await fun(cookie);
  } else if (!cookie) {
    console.log(
      `Cannot proceed with ${fun.name} because cookie does not exist`
    );
    throw new Error(`No cookie for ${fun.name}`);
  }
}
