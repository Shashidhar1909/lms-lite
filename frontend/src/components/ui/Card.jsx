import React from 'react';

const Card = ({ title, value, icon: Icon, color }) => {
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center`}>
            <div className={`p-4 rounded-xl mr-4 ${color ? color.replace('text-', 'bg-').replace('600', '50') : 'bg-blue-50'} ${color || 'text-blue-600'}`}>
                {Icon && <Icon className="w-6 h-6" />}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
    );
};

export default Card;
