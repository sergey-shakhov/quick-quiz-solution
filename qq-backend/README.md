

# In browser

https://qq.example.com/quiz/ENCRYPTED2873468734589345737456


# REST

GET https://qq.example.com/api/quizzes/93874593847592384
{
  "id": "93874593847592384",
  "expiresAt": "some date with time",
  "status": "created"

}

PATCH https://qq.example.com/api/quizzes/93874593847592384
{
  "status": "started"
}

GET https://qq.example.com/api/quizzes/93874593847592384/steps/0

PATCH https://qq.example.com/api/quizzes/93874593847592384/steps/0
{
  "answer": { ... some json ... }
}

GET https://qq.example.com/api/quizzes/93874593847592384/steps/1

PATCH https://qq.example.com/api/quizzes/93874593847592384/steps/1
{
  "answer": { ... some json ... },
  "improvementSuggested": true
}


The next step becomes available only after submitting answer for current one.



# Status sequence

1. created
2. started
3. finishedExplicitly
4. finishedWithTimeout


