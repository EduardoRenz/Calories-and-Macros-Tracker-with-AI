import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Customize heading styles
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-1" {...props} />,

                    // Customize paragraph
                    p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,

                    // Customize lists
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-2" {...props} />,

                    // Customize code blocks
                    // Customize code blocks
                    code: (props: any) => {
                        const { node, inline, className, children, ...rest } = props;
                        return inline ? (
                            <code className="bg-healthpal-card px-1.5 py-0.5 rounded text-sm font-mono" {...rest}>
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-healthpal-card p-3 rounded-lg my-2 text-sm font-mono overflow-x-auto" {...rest}>
                                {children}
                            </code>
                        );
                    },

                    // Customize links
                    a: ({ ...props }) => (
                        <a className="text-healthpal-primary hover:underline" {...props} />
                    ),

                    // Customize tables
                    table: ({ ...props }) => (
                        <div className="overflow-x-auto my-2">
                            <table className="min-w-full border-collapse border border-healthpal-border" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => (
                        <th className="border border-healthpal-border bg-healthpal-card px-3 py-2 text-left font-semibold" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="border border-healthpal-border px-3 py-2" {...props} />
                    ),

                    // Customize strong/bold
                    strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,

                    // Customize emphasis/italic
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
