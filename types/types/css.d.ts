// types/css.d.ts

// Allow TypeScript to understand CSS imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Allow side-effect CSS imports (like your globals.css)
declare module '*.css?inline' {
  const content: { [className: string]: string };
  export default content;
}