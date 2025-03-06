import { Request, Response, Router } from "express";
import { Poll } from "../models/poll.model";

const router = Router();

// Get all polls
router.get("/", async (req: Request, res: Response) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: "Error fetching polls" });
  }
});

// Get a single poll
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: "Error fetching poll" });
  }
});

// Create a new poll
router.post("/", async (req: Request, res: Response) => {
  try {
    const { question, options, endDate, requireVoterName = true } = req.body;
    const poll = new Poll({
      question,
      options: options.map((text: string) => ({ text, votes: 0, voters: [] })),
      endDate,
      requireVoterName,
    });
    const savedPoll = await poll.save();
    res.status(201).json(savedPoll);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error creating poll" });
  }
});

// Vote on a poll option
router.post("/:id/vote/:optionId", async (req: Request, res: Response) => {
  try {
    const { voterName } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.requireVoterName && !voterName) {
      return res
        .status(400)
        .json({ message: "Voter name is required for this poll" });
    }

    const optionId = req.params.optionId;
    if (!poll.options.some((option) => option.id === optionId)) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    if (!poll.isActive || poll.endDate < new Date()) {
      return res.status(400).json({ message: "Poll is no longer active" });
    }

    // Check if user has already voted on this poll (only if voter name is required)
    if (poll.requireVoterName) {
      const hasVoted = poll.options.some((option) =>
        option.voters.some((voter) => voter.voterName === voterName)
      );

      if (hasVoted) {
        return res
          .status(400)
          .json({ message: "You have already voted on this poll" });
      }
    }

    // Add vote and voter information
    const option = poll.options.find((option) => option.id === optionId);
    if (!option) {
      return res.status(400).json({ message: "Invalid option id" });
    }

    option.votes += 1;
    if (voterName) {
      option.voters.push({
        voterName,
        timestamp: new Date(),
      });
    }

    await poll.save();
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error voting on poll" });
  }
});

// Close a poll
router.patch("/:id/close", async (req: Request, res: Response) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: "Error closing poll" });
  }
});

export default router;
