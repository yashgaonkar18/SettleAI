import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="relative mb-8 w-full max-w-[400px] flex gap-4  p-5 px-4 py-2 rounded-lg border border-gray-300 bg-white ">
            <Search size={22} className="shrink-0" />
            <input type="text" placeholder="Search invoices or clients..." className="text-[14px] bg-none outline-none" />
        </div>
    );
}