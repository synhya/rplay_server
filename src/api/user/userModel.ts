import mongoose, { Schema } from "mongoose";
import type { User } from "./userValidation";

const userSchemaMongoose = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true }, // 필수, 고유, 인덱스 설정
    name: { type: String, required: true }, // 필수 필드 설정
    email: { type: String, required: true, unique: true, index: true }, // 필수, 고유, 인덱스 설정
    age: { type: String, required: true }, // 필수 필드 설정
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    virtuals: {
      idStr: {
        get: function () {
          return this.id.toString();
        },
      },
    },
  },
);

export const UserModel = mongoose.model<User>("user", userSchemaMongoose);

// Customer.find({ name: 'A' }).
//   then(customers => {
//     console.log(customers[0].name); // 'A'
//     return Customer.find({ name: 'B' });
//   }).
//   then(customers => {
//     console.log(customers[0].name); // 'B'
//   });

// Users.findOne({ id: 12 })
//   .exec() // returns full ES6 Promise
//   .then(theUser => {
//     let name = theUser.name;
//     let newName = name + ' the cat';
//     return Users.findOneAndUpdate(
//       { id: 12 },
//       { name: newName },
//       { upsert: true, new: true }
//     );
//   })

// 공식 문서를 보면 find, findOne, findById, findOneAndUpdate 등의 메서드의 리턴값은 Query라고 되어 있다.
// Mongoose Query는 프로미스가 아니고, then을 사용할 수 있는 일종의 유사 프로미스라고 할 수 있다.

// find, findOne 등의 메서드 뒤에 exec()을 붙이든 안 붙이든 기능은 동일하다.

// 대신 exec()을 사용하면 유사 프로미스가 아닌 온전한 프로미스를 반환값으로 얻을 수 있으며,
// 에러가 났을 때 stack trace에 오류가 발생한 코드의 위치가 포함되기 때문에 공식 문서에서도 exec()을 사용할 것을 권장하고 있다.
