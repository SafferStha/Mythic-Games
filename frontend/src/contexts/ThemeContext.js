import React, { useEffect, useState } from "react";

const ThemeToggle = () => {
	const [theme, setTheme] = useState(() => {
		return localStorage.getItem("theme") || "dark";
	});

	useEffect(() => {
		document.body.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
	};

	return (
		<li className="theme-toggle" onClick={toggleTheme}>
			<i className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"} theme-icon`}></i>
		</li>
	);
};

export default ThemeToggle;
