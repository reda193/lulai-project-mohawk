# Next.js Resources and Best Practices (Backend)

- Next.js is a powerful React framework for building robut and dynamic web applications. Includes features such as server-side rendering, and static site generation.

1. Fetching data on the server: Fetch data on the server with Server Componenets
   - Have direct access to backend data resources (databases)
   - Keep your application more secure by preventing sensitive information such as access tokens
     and API keys being exposted to the client
   - Fetch dat anad render in the same environment, reduces back-and-forth communication between
     client and server (https://vercel.com/blog/how-react-18-improves-application-performance)
   - Perform multiple data fetches with single round-trip insteado f multiple individual             requests on the client
   - Reduce client-server waterfalls (when you must wait for one request in order for another
     request to be processed)

2. Fetching data when it's needed
   - If you need the same data (current user) in multiple components in a tree, you can use         fetch or React cache in the component that needs the data without worryingabout the             perfomrnace implications of making multiple requests for the same data.
     // Fetch request are automatically memoized. https://nextjs.org/docs/14/app/building-your-application/caching#request-memoization


   
