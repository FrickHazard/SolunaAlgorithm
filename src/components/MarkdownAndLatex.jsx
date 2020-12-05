import React from 'react'
import ReactMarkdown from 'react-markdown';
import MathJax from 'react-mathjax';
import RemarkMathPlugin from 'remark-math';

export const Markdown = (props) => {
    const newProps = {
        ...props,
        plugins: [
            RemarkMathPlugin,
        ],
        renderers: {
            ...props.renderers,
            math: (props) =>
                <MathJax.Node formula={props.value} />,
            inlineMath: (props) =>
                <MathJax.Node inline formula={props.value} />
        }
    };
    return (
        <MathJax.Provider input="tex">
            <ReactMarkdown {...newProps} />
        </MathJax.Provider>
    );
}
