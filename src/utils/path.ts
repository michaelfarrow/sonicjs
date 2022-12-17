export function libPath(p?: string | null) {
  return (p && `http://localhost:3000/lib/${p}`) || undefined;
}
