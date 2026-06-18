import mongoose from "mongoose";

const prospectSchema = new mongoose.Schema(
  {
    // Manual scout-entered data.
    // These fields belong to our app/MongoDB, not Elite Prospects.

    manualBirthYear: {
      type: String,
      default: null,
    },

    manualDateOfBirth: {
      type: String,
      default: null,
    },

    manualAge: {
      type: String,
      default: null,
    },

    manualPlusMinus: {
      type: String,
      default: null,
    },

    manualJerseyNumber: {
      type: String,
      default: null,
    },
    manualHeight: {
      type: String,
      default: null,
    },

    manualWeight: {
      type: String,
      default: null,
    },

    manualShoots: {
      type: String,
      default: null,
    },

    manualNotes: {
      type: String,
      default: null,
    },

    manualUpdatedAt: {
      type: Date,
      default: null,
    },
    eliteId: { type: String, required: true, unique: true, index: true },

    enriched: Boolean,
    enrichedAt: Date,

    id: Number,
    name: String,
    team: String,
    league: String,
    position: String,

    playerType: String,
    statusText: String,
    gameStatus: String,

    age: Number,
    yearOfBirth: Number,
    dateOfBirth: String,

    nationality: String,
    secondaryNationality: String,
    placeOfBirth: String,

    shoots: String,
    handednessLabel: String,

    height: String,
    heightImperial: String,
    weight: String,
    weightImperial: String,

    games: Number,
    goals: Number,
    assists: Number,
    points: Number,
    pim: Number,
    ppg: Number,
    plusMinus: Number,

    season: String,
    jerseyNumber: String,
    leagueLevel: String,
    leagueType: String,
    teamCountry: String,

    imageUrl: String,
    eliteUrl: String,
    eliteUpdatedAt: String,

    // Store the full Elite Prospects response
    rawElite: mongoose.Schema.Types.Mixed,
    rawEliteKeys: [String],

    status: String,
    upside: String,
    source: String,

    syncedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.Prospect ||
  mongoose.model("Prospect", prospectSchema);
