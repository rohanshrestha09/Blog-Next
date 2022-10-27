import { Schema, models, model } from 'mongoose';
import { IBlogSchema } from '../interface/schema';

export const genre: string[] = [
  'Technology',
  'Science',
  'Programming',
  'Fashion',
  'Food',
  'Travel',
  'Music',
  'Lifestyle',
  'Fitness',
  'DIY',
  'Sports',
  'Finance',
  'Gaming',
  'News',
  'Movie',
  'Personal',
  'Business',
  'Political',
];

const BlogSchema = new Schema<IBlogSchema>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author missing'],
    },
    image: { type: String, default: null },
    imageName: { type: String, default: null },
    title: {
      type: String,
      required: [true, 'Title missing'],
    },
    content: {
      type: String,
      required: [true, 'Content missing'],
    },
    genre: {
      type: [String],
      required: [true, 'Atleast one genre required'],
      validate: [
        function (val: any) {
          return val.length <= 4;
        },
        'Only 4 genre allowed',
      ],
      enum: {
        values: genre as Array<String>,
        message: '{VALUE} not supported',
      },
    },
    likers: { type: [Schema.Types.ObjectId], default: [] },
    likesCount: { type: Number, default: 0 },
    comments: { type: [Schema.Types.ObjectId], default: [] },
    commentsCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Blog || model<IBlogSchema>('Blog', BlogSchema);
