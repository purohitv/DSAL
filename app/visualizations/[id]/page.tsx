import { notFound } from "next/navigation";

// Mock Data Source - In future this comes from API/DB
const algorithms: Record<string, { title: string; description: string }> = {
    "bst": {
        title: "Binary Search Tree",
        description: "Visualize insertion, deletion, and search operations.",
    },
    "dijkstra": {
        title: "Dijkstra's Algorithm",
        description: "Find the shortest path in a weighted graph.",
    },
};

export default function VisualizationPage({ params }: { params: { id: string } }) {
    const algo = algorithms[params.id];

    if (!algo) {
        return notFound();
    }

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar Placeholder */}
            <div className="h-16 border-b border-white/10 flex items-center px-6 bg-[#111318]">
                <h1 className="text-xl font-bold">{algo.title}</h1>
            </div>

            <div className="flex-1 flex">
                {/* Sidebar / Code Panel */}
                <div className="w-1/4 border-r border-white/10 bg-[#0d1117] p-4 text-slate-300 font-mono text-sm">
                    {/* Dynamic Code Loading would go here */}
                    <p>// {algo.title} Implementation</p>
                    <p>void visualize() {"{"}</p>
                    <p className="pl-4">...</p>
                    <p>{"}"}</p>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-[#05050a] relative flex items-center justify-center">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-pulse">
                            {params.id === 'bst' ? 'account_tree' : 'hub'}
                        </span>
                        <p className="text-gray-400">Interactive Visualization Canvas</p>
                        <p className="text-xs text-gray-600 mt-2">ID: {params.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
