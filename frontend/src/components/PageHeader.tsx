interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: Props) {
  return (
    <header className="page-header">
      {eyebrow && <div className="hero-eyebrow">{eyebrow}</div>}
      <h1 className="display">{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </header>
  );
}
