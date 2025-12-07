# Implementation Plan

- [x] 1. Create data utility functions
  - Create `src/utils/personData.ts` with functions to load and process person JSON files
  - Implement `getAllPeople()` to read all JSON files from source directory
  - Implement `getPersonById()` to load specific person data
  - Implement `extractIdFromFilename()` to generate URL-friendly IDs from filenames
  - Implement `formatPeriod()` for date range formatting
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Create TypeScript interfaces for person data
  - Define interfaces in `src/utils/personData.ts` for type safety
  - Create `PersonalInfo`, `AcademicDegree`, `ProfessionalPosition`, `Project`, and `PersonData` interfaces
  - _Requirements: 5.4_

- [x] 3. Implement PersonCard component
  - Create `src/components/PersonCard.astro` for displaying person summaries
  - Accept props: name, summary, and id
  - Add clickable card linking to person's profile page
  - Style with responsive design
  - _Requirements: 1.2, 1.3, 4.1, 4.3_

- [x] 4. Implement PersonHeader component
  - Create `src/components/PersonHeader.astro` for person page headers
  - Display complete name, contact information, and summary text
  - Use responsive layout with professional styling
  - _Requirements: 2.1, 2.2, 4.1, 4.3_

- [x] 5. Implement AcademicSection component
  - Create `src/components/AcademicSection.astro` for academic background
  - Display degrees chronologically with institution, years, and descriptions
  - Handle missing optional fields gracefully
  - _Requirements: 2.3, 4.1, 5.3_

- [x] 6. Implement ProfessionalSection component
  - Create `src/components/ProfessionalSection.astro` for professional experience
  - Display positions with institutions, periods, and roles
  - Group by institution where appropriate
  - _Requirements: 2.4, 4.1, 5.3_

- [x] 7. Implement ProjectsSection component
  - Create `src/components/ProjectsSection.astro` for projects display
  - Accept props: projects array and section title
  - Display project names, periods, descriptions, team members, and funding
  - Make reusable for research, extension, and development projects
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 5.3_

- [x] 8. Create index page listing all people
  - Update `src/pages/index.astro` to list all people
  - Use `getAllPeople()` utility to load person data
  - Render PersonCard components for each person
  - Add page title and introduction text
  - _Requirements: 1.1, 1.2, 4.2, 5.1_

- [x] 9. Create dynamic person profile page
  - Create `src/pages/person/[id].astro` for individual person pages
  - Implement `getStaticPaths()` to generate routes for all people
  - Load person data using `getPersonById()`
  - Render PersonHeader, AcademicSection, ProfessionalSection, and ProjectsSection components
  - Add navigation link back to index page
  - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 5.1, 5.2_

- [x] 10. Add error handling and validation
  - Add validation in utility functions to check required fields
  - Implement graceful handling of missing optional fields in components
  - Add build-time error logging for invalid data
  - _Requirements: 5.3, 5.4_

- [x] 11. Add styling and responsive design
  - Create shared CSS variables for consistent styling
  - Implement responsive breakpoints for mobile, tablet, and desktop
  - Ensure WCAG AA color contrast compliance
  - Test layout on different screen sizes
  - _Requirements: 4.1, 4.3, 4.4_

- [ ]* 12. Test the implementation
  - Verify all JSON files are loaded correctly
  - Check that correct number of pages are generated
  - Test navigation between index and person pages
  - Verify responsive design on different devices
  - Test with missing/optional data fields
  - _Requirements: All_
