const boilerplates = {
    "JavaScript": `console.log("Hello, DoCode!");`,
    "Python": `print("Hello, DoCode!")`,
    "Java": `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, DoCode!");\n    }\n}`,
    "C": `#include <stdio.h>\nint main() {\n    printf("Hello, DoCode!\\n");\n    return 0;\n}`,
    "C++": `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, DoCode!" << endl;\n    return 0;\n}`
};
window.getBoilerplate = (lang) => boilerplates[lang] || "";