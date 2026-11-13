/** IT-related faculties and departments from the supplied University of Ilorin data. */
export const unilorinItFaculties = [
  {
    name: "Communication & Information Sciences",
    departments: [
      "Computer Science",
      "Information Technology",
      "Library & Information Science",
      "Telecommunication Science",
    ],
  },
  {
    name: "Engineering & Technology",
    departments: ["Computer Engineering", "Electrical & Electronics Engineering"],
  },
  {
    name: "Physical Sciences",
    departments: ["Mathematics", "Statistics"],
  },
] as const;

export function isUnilorinItDepartment(faculty: string, department: string) {
  return unilorinItFaculties.some(
    (entry) => entry.name === faculty && entry.departments.some((name) => name === department),
  );
}
