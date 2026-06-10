import React, { useEffect, useState } from 'react';
import './SvamLoad.css';

export interface ISvamLoadProps {
    startLoading?: boolean
}

const SvamLoad = (props: ISvamLoadProps) => {

    const [showLoading, setShowLoading] = useState(false);

    const handleStartLoading = () => {
        setShowLoading(true);
        setTimeout(() => {
            setShowLoading(false);
        }, 4000);
    };

    useEffect(() => {
        if (props.startLoading) {
            handleStartLoading();
        }
    }, [props.startLoading]);

    if (!showLoading) {
        return null;
    }

    return (
        <div>
            <div id="svam">
                <div className={`cover loading`}>
                    <div className="shape s1"></div>
                    <div className="shape s2"></div>
                    <div className="shape s3"></div>
                </div>
            </div>
        </div>
    );

};

export default SvamLoad;