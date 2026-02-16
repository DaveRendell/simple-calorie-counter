import type { ReactNode } from "react";
import "./Header.css";

interface HeaderProps {
  title: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Header({ title, leftIcon, rightIcon }: HeaderProps) {
  return (
    <header className="header">
      {leftIcon ?? <div className="header-spacer" />}
      <h1 className="header-title">{title}</h1>
      {rightIcon ?? <div className="header-spacer" />}
    </header>
  );
}
