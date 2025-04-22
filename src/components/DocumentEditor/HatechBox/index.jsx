import React from 'react';
import './index.less';

const HatechBox = ({ title, children }) => {
    // 解构出不同插槽的子元素
    const {
        'hatech-header-left-slot': headerLeftSlot,
        'hatech-header-slot': headerSlot,
        'hatech-content': contentSlot
    } = React.Children.toArray(children).reduce((acc, child) => {
        if (child.props?.slot) {
            acc[child.props.slot] = child;
        }
        return acc;
    }, {});

    return (
        <div className="hatech-box">
            <div className="hatech-header">
                {title ? (
                    <div className="hatech-header-left">
                        <span className="hatech-title" title={title}>{title}</span>
                    </div>
                ) : (
                    <div className="hatech-header-left">
                        {headerLeftSlot}
                    </div>
                )}
                <div className="hatech-header-right">
                    {headerSlot}
                </div>
            </div>
            {contentSlot}
        </div>
    );
};

export default HatechBox;