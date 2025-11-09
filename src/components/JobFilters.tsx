import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  moodFilter: string;
  onMoodFilterChange: (mood: string) => void;
  totalCount: number;
  filteredCount: number;
}

export const JobFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  moodFilter,
  onMoodFilterChange,
  totalCount,
  filteredCount,
}: JobFiltersProps) => {
  const hasActiveFilters = searchQuery || statusFilter !== "all" || moodFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="done">Complete</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        {/* Mood Filter */}
        <Select value={moodFilter} onValueChange={onMoodFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            <SelectItem value="cinematic">Cinematic</SelectItem>
            <SelectItem value="upbeat">Upbeat</SelectItem>
            <SelectItem value="chill">Chill</SelectItem>
            <SelectItem value="dramatic">Dramatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {hasActiveFilters ? (
          <>
            <span>
              Showing <strong className="text-foreground">{filteredCount}</strong> of{" "}
              <strong className="text-foreground">{totalCount}</strong> jobs
            </span>
            {filteredCount !== totalCount && (
              <Badge variant="secondary" className="ml-2">
                Filtered
              </Badge>
            )}
          </>
        ) : (
          <span>
            <strong className="text-foreground">{totalCount}</strong> total jobs
          </span>
        )}
      </div>
    </div>
  );
};
