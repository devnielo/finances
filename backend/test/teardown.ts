export default async (): Promise<void> => {
  // Cleanup global resources
  console.log('🧹 Cleaning up test environment...');
  
  // Add any global cleanup logic here
  // For example, closing database connections, cleaning temp files, etc.
  
  // Force exit if needed (sometimes Jest hangs)
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};