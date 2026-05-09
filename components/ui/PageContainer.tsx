type PageContainerProps = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  return <section className="p-6 lg:p-10">{children}</section>;
}
