interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

export function ChevronRight(props: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={props.height || 48}
      viewBox="0 -960 960 960"
      width={props.width || 48}
      fill={props.fill || "#000"}
    >
      <path d="M530-481 332-679l43-43 241 241-241 241-43-43 198-198Z" />
    </svg>
  );
}