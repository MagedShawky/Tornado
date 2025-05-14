
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ClientInfoTableHeader() {
  return (
    <TableHeader className="bg-blue-50">
      <TableRow className="text-sm font-medium">
        <TableHead colSpan={3} className="text-left p-2 font-medium border">Client info</TableHead>
        <TableHead colSpan={5} className="text-left p-2 font-medium border">Client details</TableHead>
        <TableHead colSpan={2} className="text-left p-2 font-medium border">Documents</TableHead>
        <TableHead colSpan={2} className="text-left p-2 font-medium border">Diving Info</TableHead>
      </TableRow>
      <TableRow className="text-sm font-medium">
        <TableHead className="p-2 border w-12">Bed N.</TableHead>
        <TableHead className="p-2 border w-24">Cabin</TableHead>
        <TableHead className="border text-left p-2 font-medium">Group name</TableHead>
        <TableHead className="border text-left p-2 font-medium">Name</TableHead>
        <TableHead className="border text-left p-2 font-medium">Surname</TableHead>
        <TableHead className="border text-left p-2 font-medium">Food remarks</TableHead>
        <TableHead className="border text-left p-2 font-medium">Document upload</TableHead>
        <TableHead className="border text-left p-2 font-medium">Date of birth</TableHead>
        <TableHead className="border text-left p-2 font-medium">Visa number</TableHead>
        <TableHead className="border text-left p-2 font-medium">Visa issue date</TableHead>
        <TableHead className="border text-left p-2 font-medium">Diving license type</TableHead>
        <TableHead className="border text-left p-2 font-medium">Diving level</TableHead>
      </TableRow>
    </TableHeader>
  );
}
