const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for local development
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Fetch contests and questions from LeetCode GraphQL API
app.post("/fetch-contests", async (req, res) => {
  const { topic} = req.body;
  const recent = req.body.recentContests;
  const graphqlQueryContests = {
    query: `
      query {
        allContests {
          title
          titleSlug
          startTime
          duration
          isVirtual
        }
      }
    `,
  };

  try {
    // Fetch contests
    const response = await axios.post("https://leetcode.com/graphql/", graphqlQueryContests, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.data.data || !response.data.data.allContests) {
      return res.status(500).send("Failed to fetch contests.");
    }

    const contests = response.data.data.allContests;

    // Sort contests by start time (most recent first)
    const currentTime = Math.floor(Date.now() / 1000);
    const filteredContests = contests.map((contest) => {
      // Convert UNIX timestamp to a normal date-time format
      const startTime = new Date(contest.startTime * 1000);
      return {
        ...contest,
        startTimeFormatted: startTime.toLocaleString(), // Format the date as per your locale
      };
    }).filter((contest) => contest.startTime < currentTime); // Keep contests starting after the current time


    // Limit to recent contests (optional: pass a limit in the request body or set a default)
     // Default: fetch 5 recent contests
    const limitedContests = filteredContests.slice(0, recent);
    // limitedContests.map((contest) => {
    //   console.log(contest.titleSlug);
    // })
    // Fetch questions for each contest
    const fetchQuestionsPromises = limitedContests.map(async (contest) => {
      const graphqlQueryQuestions = {
        query: `
          query getContestQuestions($titleSlug: String!) {
            contest(titleSlug: $titleSlug) {
              title
              questions {
                title
                titleSlug
                questionId
              }
            }
          }
        `,
        variables: { titleSlug: contest.titleSlug },
      };

      const questionsResponse = await axios.post("https://leetcode.com/graphql/", graphqlQueryQuestions, {
        headers: { "Content-Type": "application/json" },
      });

      if (questionsResponse.data.data && questionsResponse.data.data.contest) {
        return questionsResponse.data.data.contest.questions;
      } else {
        return [];
      }
    });

    const allQuestions = (await Promise.all(fetchQuestionsPromises)).filter(Boolean);
    
    // Flatten all questions into a single array
    const flatQuestions = allQuestions.flat();
    // console.log(flatQuestions);
    // Fetch detailed question data for topic filtering (optional)

    // const fetchDetailedQuestionsPromises = flatQuestions.map(async (ques) => {
    //     if (!ques || !ques.titleSlug) {
    //         // Skip this question if it's null or doesn't have a titleSlug
    //         return null;
    //     }
    //   const graphqlQueryDetails = {
    //     query: `
    //       query getQuestionDetails($titleSlug: String!) {
    //         question(titleSlug: $titleSlug) {
    //           title
    //           questionId
    //           titleSlug
    //           topicTags {
    //             name
    //             slug
    //           }
    //         }
    //       }
    //     `,
    //     variables: { titleSlug: ques.titleSlug },
    //   };
    // //   console.log(ques.titleSlug," :",ques.)
    //   const detailedResponse = await axios.post("https://leetcode.com/graphql/", graphqlQueryDetails, {
    //     headers: { "Content-Type": "application/json" },
    //   });

    //   const detailedQuestion = detailedResponse.data.data.question;
    //   console.log(
    //     `Fetched detailed question data for ${detailedQuestion.titleSlug}:`,
    //     detailedQuestion
    //   )
    //   // Check for specific topic tags (e.g., "Array")
    //   if (detailedQuestion.topicTags && Array.isArray(detailedQuestion.topicTags)) {
    //     if (detailedQuestion.topicTags.some((tag) => tag.name === "Array")) {
    //       return ques.titleSlug;
    //     }
    //   }
    //   return null;
    // });

    // const filteredQuestions = (await Promise.all(fetchDetailedQuestionsPromises)).filter((titleSlug) => titleSlug !== null);
 
    // Respond with the filtered questions
      const filteredQuestions = [];

      for (const ques of flatQuestions) {
          if (!ques || !ques.titleSlug) {
              // Skip this question if it's null or doesn't have a titleSlug
              continue;
          }

          const graphqlQueryDetails = {
              query: `
            query getQuestionDetails($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                title
                questionId
                titleSlug
                difficulty
                topicTags {
                    name
                    slug
                }
                }
            }
            `,
              variables: { titleSlug: ques.titleSlug },
          };

          try {
              const detailedResponse = await axios.post("https://leetcode.com/graphql/", graphqlQueryDetails, {
                  headers: { "Content-Type": "application/json" },
              });

              const detailedQuestion = detailedResponse.data.data.question;

              // console.log(
              //     `Fetched detailed question data for ${detailedQuestion.titleSlug}:`,
              //     detailedQuestion
              // );

              // Check for specific topic tags (e.g., "Array")
              if (
                  detailedQuestion.topicTags &&
                  Array.isArray(detailedQuestion.topicTags) &&
                  detailedQuestion.topicTags.some((tag) => tag.name === topic)
              ) {
                  filteredQuestions.push({
                    titleSlug: ques.titleSlug,
                    difficulty: detailedQuestion.difficulty,
                  });
              }
          } catch (error) {
              console.error(`Error fetching details for question ${ques.titleSlug}:`, error.message);
          }
      }

      // `filteredQuestions` now contains the list of valid titleSlugs
    //   console.log("Filtered Questions:", filteredQuestions);

    res.json(filteredQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch contests or questions.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
