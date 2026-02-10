import React from 'react';
import { Clock, BarChart, User } from 'lucide-react';

const CourseCard = ({ course, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={course.thumbnail || 'https://placehold.co/400x250?text=Course+Thumbnail'}
                    alt={course.title}
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Course+Thumbnail'; }}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">
                    {course.category}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                    {course.description}
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {course.duration || '10h'}
                    </div>
                    <div className="flex items-center">
                        <BarChart className="w-3 h-3 mr-1" />
                        {course.difficulty || 'Beginner'}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            {/* Placeholder for instructor avatar */}
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
                                {course.instructor?.name?.charAt(0) || 'I'}
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {course.instructor?.name || 'Instructor'}
                        </span>
                    </div>
                    {course.enrollmentStatus ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Enrolled
                        </span>
                    ) : (
                        <span className="text-blue-600 font-semibold text-sm group-hover:underline">
                            View Course
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
