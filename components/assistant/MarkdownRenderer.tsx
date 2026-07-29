import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="prose prose-invert prose-sm max-w-none select-text">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Customize heading styles
                    h1: ({ ...props }) => <h1 className="text-xl font-bold mb-2 select-text" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-lg font-bold mb-2 select-text" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-base font-bold mb-1 select-text" {...props} />,

                    // Customize paragraph
                    p: ({ ...props }) => <p className="mb-2 leading-relaxed select-text" {...props} />,

                    // Customize lists
                    ul: ({ ...props }) => <ul className="list-disc list-inside mb-2 space-y-1 select-text" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1 select-text" {...props} />,
                    li: ({ ...props }) => <li className="ml-2 select-text" {...props} />,

                    // Customize code blocks
                    code: (props: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
                        const { inline, children, ...rest } = props;
                        return inline ? (
                            <code className="bg-neutral-card px-1.5 py-0.5 rounded text-sm font-mono select-text" {...rest}>
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-neutral-card p-3 rounded-lg my-2 text-sm font-mono overflow-x-auto select-text" {...rest}>
                                {children}
                            </code>
                        );
                    },

                    // Customize links
                    a: ({ ...props }) => (
                        <a className="text-brand-primary hover:underline select-text" {...props} />
                    ),

                    // Customize tables
                    table: ({ ...props }) => (
                        <div className="overflow-x-auto my-2">
                            <table className="min-w-full border-collapse border border-neutral-border select-text" {...props} />
                        </div>
                    ),
                    th: ({ ...props }) => (
                        <th className="border border-neutral-border bg-neutral-card px-3 py-2 text-left font-semibold select-text" {...props} />
                    ),
                    td: ({ ...props }) => (
                        <td className="border border-neutral-border px-3 py-2 select-text" {...props} />
                    ),

                    // Customize strong/bold
                    strong: ({ ...props }) => <strong className="font-bold text-neutral-text-primary select-text" {...props} />,

                    // Customize emphasis/italic
                    em: ({ ...props }) => <em className="italic select-text" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
