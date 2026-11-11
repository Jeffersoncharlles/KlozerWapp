import { ArrowRight, Construction, MessageCircle } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { PageContainer, WorkspaceHeader } from "../components/workspace-header";

export function FeaturePlaceholder({ title }: { title: string }) {
  return (
    <PageContainer>
      <WorkspaceHeader title={title} description="Área preparada para os recursos do Klozer CRM" />
      <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/70 bg-card/70 text-center">
          <CardHeader className="items-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400"><Construction className="size-6" /></div>
            <CardTitle className="mt-2">{title}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm leading-6 text-muted-foreground">Esta área já está disponível no menu e receberá os dados da API correspondente na próxima etapa.</p><Button className="mt-5 bg-emerald-500 text-emerald-950 hover:bg-emerald-400" render={<Link to="/dashboard" />}><MessageCircle className="size-4" /> Voltar para visão geral <ArrowRight className="size-4" /></Button></CardContent>
        </Card>
      </main>
    </PageContainer>
  );
}
