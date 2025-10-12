
import { sessionTypes } from "@/lib/data";
import { Card } from "./ui/card";

export function AgendaLegend() {
  return (
    <footer className="w-full flex-shrink-0 px-4 pb-4 lg:px-6 lg:pb-6 z-10">
      <Card className="p-2 lg:p-3">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {sessionTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-xs font-medium text-muted-foreground">{type.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </footer>
  );
}
